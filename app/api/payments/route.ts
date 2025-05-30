import { NextResponse } from 'next/server';
import { getPaymentsByUserId } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');

    if (!userId || userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await getPaymentsByUserId({
      userId,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in payments API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 