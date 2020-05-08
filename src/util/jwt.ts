import * as jwt from 'jsonwebtoken';

export const sign = (data, secret) => {
  return jwt.sign(data, secret);
}

export const verify = (value, secret) => {
  return jwt.verify(value, secret);
}