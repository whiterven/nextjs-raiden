//lib/db/queries.ts
import 'server-only';

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  type Chat,
  stream,
  payment,
  oauthToken,
  oauthState,
  type OAuthToken,
  type OAuthState,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import { generateHashedPassword } from './utils';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatSDKError } from '../errors';

// Ensure we're using the correct connection string
const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('POSTGRES_URL is not defined');
}

// Create a new connection for queries
const queryClient = postgres(connectionString);
const db = drizzle(queryClient);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    const users = await db
      .select({
        id: user.id,
        email: user.email,
        password: user.password,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        language: user.language ?? null,
        communicationEmails: user.communicationEmails ?? null,
        marketingEmails: user.marketingEmails ?? null,
        socialEmails: user.socialEmails ?? null,
        securityEmails: user.securityEmails ?? null,
        type: user.type,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        avatarUrl: user.avatarUrl ?? null,
        bio: user.bio ?? null,
        timezone: user.timezone ?? null
      })
      .from(user)
      .where(eq(user.email, email));
    return users;
  } catch (error) {
    console.error('Database error in getUser:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string, firstName: string, lastName: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    const result = await db.insert(user).values({
      email,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null
    }).returning({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
    
    return result;
  } catch (error) {
    console.error('Database error in createUser:', error);
    throw new ChatSDKError('bad_request:database', 'Failed to create user');
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db
      .insert(user)
      .values({
        email,
        password,
        firstName: 'Guest',
        lastName: 'User'
      })
      .returning();
  } catch (error) {
    console.error('Database error in createGuestUser:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create guest user',
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save chat');
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete chat by id',
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${startingAfter} not found`,
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          'not_found:database',
          `Chat with id ${endingBefore} not found`,
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get chats by user id',
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get chat by id');
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save messages');
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get messages by chat id',
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to vote message');
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get votes by chat id',
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to save document');
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get documents by id',
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get document by id',
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete documents by id after timestamp',
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document id',
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message by id',
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete messages by chat id after timestamp',
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to update chat visibility by id',
    );
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: { id: string; differenceInHours: number }) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000,
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, 'user'),
        ),
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get message count by user id',
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to create stream id',
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get stream ids by chat id',
    );
  }
}

export async function getPaymentsByUserId({
  userId,
  page = 1,
  limit = 10,
}: {
  userId: string;
  page?: number;
  limit?: number;
}) {
  try {
    const offset = (page - 1) * limit;

    const payments = await db
      .select()
      .from(payment)
      .where(eq(payment.userId, userId))
      .orderBy(desc(payment.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ value: count() })
      .from(payment)
      .where(eq(payment.userId, userId));

    return {
      payments,
      totalPages: Math.ceil(Number(totalCount[0].value) / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Database error in getPaymentsByUserId:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get payments by user id',
    );
  }
}

// OAuth Token Management
export async function saveOAuthToken({
  userId,
  provider,
  accessToken,
  refreshToken,
  expiresAt,
  scope,
  tokenType = 'Bearer'
}: {
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
  tokenType?: string;
}) {
  try {
    return await db
      .insert(oauthToken)
      .values({
        userId,
        provider,
        accessToken,
        refreshToken: refreshToken || null,
        expiresAt: expiresAt || null,
        scope: scope || null,
        tokenType,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: [oauthToken.userId, oauthToken.provider],
        set: {
          accessToken,
          refreshToken: refreshToken || null,
          expiresAt: expiresAt || null,
          scope: scope || null,
          tokenType,
          updatedAt: new Date()
        }
      })
      .returning();
  } catch (error) {
    console.error('Database error in saveOAuthToken:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save OAuth token'
    );
  }
}

export async function getOAuthToken({
  userId,
  provider
}: {
  userId: string;
  provider: string;
}) {
  try {
    const [token] = await db
      .select()
      .from(oauthToken)
      .where(
        and(
          eq(oauthToken.userId, userId),
          eq(oauthToken.provider, provider)
        )
      );
    return token;
  } catch (error) {
    console.error('Database error in getOAuthToken:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get OAuth token'
    );
  }
}

export async function getUserOAuthTokens({ userId }: { userId: string }) {
  try {
    return await db
      .select({
        provider: oauthToken.provider,
        scope: oauthToken.scope,
        expiresAt: oauthToken.expiresAt,
        createdAt: oauthToken.createdAt,
        updatedAt: oauthToken.updatedAt
      })
      .from(oauthToken)
      .where(eq(oauthToken.userId, userId));
  } catch (error) {
    console.error('Database error in getUserOAuthTokens:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user OAuth tokens'
    );
  }
}

export async function deleteOAuthToken({
  userId,
  provider
}: {
  userId: string;
  provider: string;
}) {
  try {
    return await db
      .delete(oauthToken)
      .where(
        and(
          eq(oauthToken.userId, userId),
          eq(oauthToken.provider, provider)
        )
      )
      .returning();
  } catch (error) {
    console.error('Database error in deleteOAuthToken:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to delete OAuth token'
    );
  }
}

export async function refreshOAuthToken({
  userId,
  provider,
  accessToken,
  refreshToken,
  expiresAt
}: {
  userId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}) {
  try {
    return await db
      .update(oauthToken)
      .set({
        accessToken,
        refreshToken: refreshToken || undefined,
        expiresAt: expiresAt || undefined,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(oauthToken.userId, userId),
          eq(oauthToken.provider, provider)
        )
      )
      .returning();
  } catch (error) {
    console.error('Database error in refreshOAuthToken:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to refresh OAuth token'
    );
  }
}

// OAuth State Management (for security)
export async function saveOAuthState({
  userId,
  provider,
  state,
  codeVerifier,
  scopes,
  expiresAt
}: {
  userId: string;
  provider: string;
  state: string;
  codeVerifier?: string;
  scopes?: string;
  expiresAt: Date;
}) {
  try {
    return await db
      .insert(oauthState)
      .values({
        userId,
        provider,
        state,
        codeVerifier: codeVerifier || null,
        scopes: scopes || null,
        expiresAt
      })
      .returning();
  } catch (error) {
    console.error('Database error in saveOAuthState:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save OAuth state'
    );
  }
}

export async function verifyAndConsumeOAuthState({
  userId,
  provider,
  state
}: {
  userId: string;
  provider: string;
  state: string;
}) {
  try {
    // Get and delete the state in one transaction
    const [stateRecord] = await db
      .delete(oauthState)
      .where(
        and(
          eq(oauthState.userId, userId),
          eq(oauthState.provider, provider),
          eq(oauthState.state, state),
          gt(oauthState.expiresAt, new Date()) // Must not be expired
        )
      )
      .returning();

    return stateRecord;
  } catch (error) {
    console.error('Database error in verifyAndConsumeOAuthState:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to verify OAuth state'
    );
  }
}

export async function cleanupExpiredOAuthStates() {
  try {
    return await db
      .delete(oauthState)
      .where(lt(oauthState.expiresAt, new Date()))
      .returning();
  } catch (error) {
    console.error('Database error in cleanupExpiredOAuthStates:', error);
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to cleanup expired OAuth states'
    );
  }
}
