import { createConnection } from "typeorm";
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

export { agentLogin };
