import { createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function agentLogin(requestBody) {
  let connection;

  try {
    connection = await createConnection();

    const { email, password } = requestBody;

    const agentRepository = connection.getRepository("Agent");
    const agent = await agentRepository.findOne({ email });

    if (!agent || !(await bcrypt.compare(password, agent.password))) {
      throw new Error("Invalid credentials");
    }

    // Create token
    const token = jwt.sign(
      { agentId: agent.id, email, name: agent.name },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    agent.token = token;

    return agent;
  } catch (error) {
    console.log("Error creating agent and wallet", error);
    throw error;
  } finally {
    connection?.close();
  }
}

async function registerAgent(requestBody) {
  let connection;

  try {
    connection = await createConnection();

    const { name, email, password } = requestBody;
    const agentData = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
    };

    const walletData = {
      walletNumber: uuidv4(),
      balance: 0,
      currency: "GHS",
    };

    return await connection.transaction(async (transactionalEntityManager) => {
      const wallet = await transactionalEntityManager.save(
        "Wallet",
        walletData
      );

      const agent = await transactionalEntityManager.save("Agent", {
        ...agentData,
        wallets: [wallet],
      });

      // Create token
      const token = jwt.sign(
        { agentId: agent.id, email, name },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      agent.token = token;

      return agent;
    });
  } catch (error) {
    console.log("Error creating agent and wallet", error);
    throw error;
  } finally {
    connection?.close();
  }
}

export { agentLogin, registerAgent };
