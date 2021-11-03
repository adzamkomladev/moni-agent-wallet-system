import express from "express";

import { body, validationResult } from "express-validator";

import { findAgentViaEmail } from "../services/agent";
import { agentLogin, registerAgent } from "../services/auth";

function getAuthRoutes() {
  const router = express.Router();

  router.post(
    "/register",
    [
      body("name").exists(),
      body("email")
        .exists()
        .isEmail()
        .normalizeEmail()
        .custom((value) => {
          return findAgentViaEmail(value).then((agent) => {
            if (agent) {
              return Promise.reject("E-mail already in use");
            }
          });
        }),
      body("password").exists(),
    ],
    register
  );
  router.post(
    "/login",
    [
      body("email").exists().isEmail().normalizeEmail(),
      body("password").exists(),
    ],
    login
  );

  return router;
}

async function login(req, res) {
  const body = req.body;

  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const agent = await agentLogin(body);

    return res.status(200).json({
      id: agent.id,
      token: agent.token,
      name: agent.name,
      email: agent.email,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      wallets: agent.wallets,
    });
  } catch (error) {
    if (error.message === "Invalid credentials") {
      res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
}

async function register(req, res) {
  const body = req.body;

  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const agent = await registerAgent(body);

    return res.status(201).json({
      id: agent.id,
      token: agent.token,
      name: agent.name,
      email: agent.email,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      wallets: agent.wallets,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export { getAuthRoutes };
