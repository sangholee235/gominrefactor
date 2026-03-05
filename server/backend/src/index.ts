import express from "express";
import cors from "cors";
import http from "http";
import { assertRequiredEnv, env } from "./config/env";
import authRouter from "./routes/auth";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import sushiRouter from "./routes/sushi";
import mySushiRouter from "./routes/mySushi";
import myAnswersRouter from "./routes/myAnswers";
import shareRouter from "./routes/share";
import notificationRouter from "./routes/notification";
import chatRouter from "./routes/chat";
import { initChatSocket } from "./socket/chatSocket";

assertRequiredEnv();

const app = express();

// CORS 설정
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("API is running");
});

app.use("/api", authRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", sushiRouter);
app.use("/api", mySushiRouter);
app.use("/api/my-answers", myAnswersRouter);
app.use("/api/share", shareRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/chat", chatRouter);

// Socket.io를 위해 http.Server로 래핑
const httpServer = http.createServer(app);

// Socket.io 채팅 서버 초기화
const io = initChatSocket(httpServer);
app.set("io", io);

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
