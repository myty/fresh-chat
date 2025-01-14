import { monotonicUlid } from "@std/ulid";

const kv = await Deno.openKv(":memory:");

interface User {
  id: string;
  handle: string;
  name: string;
}

enum IdentityProvider {
  Google = "google",
  Microsoft = "microsoft",
}

interface Identity {
  id: string;
  userId: string;
  externalId: string;
  identityProvider: IdentityProvider;
}

export interface Room {
  id: string;
  name: string;
}

interface Connection {
  id: string;
  userId: string;
  roomId: string;
}

interface Message {
  id: string;
  timestamp: Date;
  message: string;
  roomId: string;
}

export async function createRoom(room: Room): Promise<Room> {
  const key = ["rooms", room.id];

  const { value: existingRoom } = await kv.get(key);
  if (existingRoom) {
    throw new Error("Room already exists");
  }

  await kv.atomic().set(key, room).commit();

  return room;
}

export async function getRoom(roomId: string) {
  const { value: room } = await kv.get<Room>([
    "rooms",
    roomId,
  ]);

  return room;
}

export async function getRoomMessages(
  roomId: string,
  options: Deno.KvListOptions = { reverse: true, limit: 25 },
): Promise<Message[]> {
  const messages: Message[] = [];

  const iter = kv.list<Message>({
    prefix: ["rooms", roomId, "messages"],
  }, options);

  for await (const res of iter) messages.push(res.value);

  return messages;
}

export async function getRoomConnections(
  roomId: string,
  options: Deno.KvListOptions = { reverse: true, limit: 25 },
): Promise<Connection[]> {
  const connections: Connection[] = [];

  const iter = kv.list<Connection>({
    prefix: ["rooms", roomId, "connections"],
  }, options);

  for await (const res of iter) connections.push(res.value);

  return connections;
}

export async function addRoomMessage(
  roomId: string,
  message: string,
): Promise<Message> {
  const messageObj: Message = {
    id: monotonicUlid(),
    timestamp: new Date(),
    message,
    roomId,
  };

  await kv.set(
    ["rooms", roomId, "messages", messageObj.id],
    messageObj,
  );

  return messageObj;
}

export function createMessageStream(roomId: string) {
  return kv.watch<Message[]>([["rooms", roomId, "messages"]]);
}