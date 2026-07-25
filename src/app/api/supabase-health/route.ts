import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('service_categories')
      .select('id, name, slug')
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không thể kết nối Supabase',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Kết nối Supabase thành công',
        database: 'reachable',
        sampleCount: data?.length ?? 0,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        message: 'Không thể kết nối Supabase',
        error: message,
      },
      { status: 500 }
    );
  }
}
