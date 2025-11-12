// src/infrastructure/routes.js
// Rutas HTTP para el microservicio de ventas

import { Router } from "express";
import { ListSales } from "../application/ListSales.js";
import { CreateSale } from "../application/CreateSale.js";
import { connectProducer, publishSaleEvent } from "./kafka/producer.js";
import { authenticateToken } from './middleware/authMiddleware.js';

export function buildSalesRouter({ saleRepository, catalogGateway }) {
  const router = Router();

  const listSales = new ListSales({ saleRepository });
  const createSale = new CreateSale({ saleRepository, catalogGateway });

  // GET /sales
  router.get("/sales", authenticateToken, async (_req, res) => {
    const sales = await listSales.execute();
    res.json(sales);
  });
  
  // POST /sales
  router.post("/sales", authenticateToken, async (req, res) => {
    try {
      const { bookId, quantity } = req.body || {};
      const sale = await createSale.execute({ bookId, quantity });

      await publishSaleEvent(sale);

      res.status(201).json(sale);
    } catch (err) {
      if (err.code === "BOOK_NOT_FOUND")
        return res.status(404).json({ message: err.message });
      if (err.code === "CATALOG_UNAVAILABLE")
        return res.status(503).json({ message: err.message });
      if (err.code === "INSUFFICIENT_STOCK")
        return res.status(409).json({ message: err.message });
      if (err.code === "INVALID_QTY")
        return res.status(400).json({ message: err.message });
      res.status(400).json({ message: err.message });
    }
  });

  return router;
}
