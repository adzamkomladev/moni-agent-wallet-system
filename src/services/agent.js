import { createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

async function createAgent(requestBody) {
  let connection;
  try {
    connection = await createConnection();
    
    const { name, email, password } = requestBody;
    const agentData = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      wallet_id: uuidv4(),
      wallet_balance: 0,
    };

    const agentRepository = connection.getRepository("Agent");
    const agent = await agentRepository.save(agentData);

    return agent;
  } catch (error) {
    console.log("Error creating agent", error);
  } finally {
    connection?.close();
  }
}

export { createAgent };
