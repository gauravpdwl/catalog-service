import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";
import productsRouter from "./product/product-router";
import cookieParser from "cookie-parser";
import toppingRouter from "./topping/topping-router";
import cors from "cors";

const app = express();

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(
    cors({
        origin: ["http://localhost:8000"],
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Hello from catalog service!" });
});

app.use("/categories", categoryRouter);
app.use("/products", productsRouter);
app.use("/toppings", toppingRouter);

app.use(globalErrorHandler);

export default app;
