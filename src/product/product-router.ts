import express from "express";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { ProductController } from "./product-controller";
import createProductValidator from "./product-validator";
import { ProductService } from "./product-service";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { S3Storage } from "../common/services/s3storage";
import updateProductValidator from "./update-product-validator";
import { createMessageProducerBroker } from "../common/factories/brokerFactory";

const router = express.Router();

const s3Storage = new S3Storage();
const productService = new ProductService();
const broker = createMessageProducerBroker();

const productController = new ProductController(
    productService,
    s3Storage,
    broker,
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    // since we are passing data through postman in multipart form data
    // we are using this middleware which converts multipart encoded data
    fileUpload({
        limits: { fileSize: 5000 * 1024 }, // 500*1024=500kb 5000*1024=5mb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    createProductValidator,
    asyncWrapper(productController.create),
);

router.put(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 5000 * 1024 }, // 5mb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    updateProductValidator,
    asyncWrapper(productController.update),
);

router.get("/", asyncWrapper(productController.index));

router.get("/:id", asyncWrapper(productController.single));

export default router;
