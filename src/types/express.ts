import express from 'express';
import User from 'src/datatypes/User';

export interface Request extends express.Request {
  user?: User;
  flash: (type: string, message: string) => void;
}

export interface Response extends express.Response {}

export interface NextFunction extends express.NextFunction {}
