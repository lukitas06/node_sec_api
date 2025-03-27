import { NextFunction } from "express";
import rateLimit from "express-rate-limit";
import moment from 'moment';
import {createClient} from 'redis';

export const rateLimiterExpress = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    max: 100,
    message: 'You have exceeded the 100 requests in 24 hrs limit!', 
    standardHeaders: true,
    legacyHeaders: false,
});


const redisClient = createClient({
    disableOfflineQueue: true,
    socket:{
        host: '127.0.0.1',
        port: 6379
    }
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    try {
      await redisClient.connect();
      console.log(" Redis conectado");
    } catch (error) {
      console.error("Error conectando a Redis:", error);
    }
  })();
  

const WINDOW_SIZE_IN_HOURS = 24;
const MAX_WINDOW_REQUEST_COUNT = 100;
const WINDOW_LOG_INTERVAL_IN_HOURS = 1;


export const customRedisRateLimiter = async (req:any, res:any, next:NextFunction) => {
    try {
        if (!redisClient.isOpen) {
            console.error("Redis no está conectado");
            return res.status(500).json({ error: "Error interno del servidor" });
          }
      // check that redis client exists
      if (!redisClient) {
        throw new Error('Redis client does not exist!');
        process.exit(1);
      }
      // fetch records of current user using IP address, returns null when no record is found
      const record = await redisClient.get(req.ip);
      const currentRequestTime = moment();
      console.log(record);
      //  if no record is found , create a new record for user and store to redis
      if (record == null) {
        let newRecord = [];
        let requestLog = {
          requestTimeStamp: currentRequestTime.unix(),
          requestCount: 1,
        };
        newRecord.push(requestLog);
        await redisClient.set(req.ip, JSON.stringify(newRecord));
        next();
      }
      // if record is found, parse it's value and calculate number of requests users has made within the last window
      else{

          let data = JSON.parse(record);
          let windowStartTimestamp = moment().subtract(WINDOW_SIZE_IN_HOURS, 'hours').unix();
          let requestsWithinWindow = data.filter((entry:any) => {
              return entry.requestTimeStamp > windowStartTimestamp;
            });
            console.log('requestsWithinWindow', requestsWithinWindow);
            let totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator:any, entry:any) => {
                return accumulator + entry.requestCount;
            }, 0);

            // if number of requests made is greater than or equal to the desired maximum, return error
            if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
                res.status(429).jsend.error(`You have exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_HOURS} hrs limit!`);
            } else {
                // if number of requests made is less than allowed maximum, log new entry
                let lastRequestLog = data[data.length - 1];
                let potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime.subtract(WINDOW_LOG_INTERVAL_IN_HOURS, 'hours').unix();
                //  if interval has not passed since last request log, increment counter
                if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
                    lastRequestLog.requestCount++;
                    data[data.length - 1] = lastRequestLog;
                } else {
                    //  if interval has passed, log new entry for current user and timestamp
                    data.push({
                        requestTimeStamp: currentRequestTime.unix(),
                        requestCount: 1,
                    });
                }
        }
        await redisClient.set(req.ip, JSON.stringify(data));
        next();
      }
    } catch (error) {
      next(error);
    }
  };

module.exports = { rateLimiterExpress, customRedisRateLimiter };

