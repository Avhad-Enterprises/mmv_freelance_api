import DB from "../database/index.schema";
import { DocumentDto } from '../dtos/document.dto';
import { NextFunction, Request, Response } from "express";
import documentService from "../services/document.services";
import HttpException from "../exceptions/HttpException";

class documentController {

    public documentService = new documentService();


    }
export default documentController;