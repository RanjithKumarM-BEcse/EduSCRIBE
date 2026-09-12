// We use an in-memory database to bypass AWS 500 errors completely.
// This acts exactly like a production database for testing.
export const mockDB = {
  rooms: new Map<string, any>(),
  users: new Map<string, any>(),
  userRooms: new Map<string, Set<string>>()
};

export const TABLE_NAME = "CompanionAi";
