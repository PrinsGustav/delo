import { Resend } from 'resend';

export async function GET() {
  try {
    const apiKey = import.meta.env.RESEND_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'RESEND_API_KEY not found',
          env: Object.keys(import.meta.env)
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Testing Resend with API key:', apiKey.substring(0, 10) + '...');
    
    const resend = new Resend(apiKey);
    
    // Test simple email
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['morten@trase.no'],
      subject: 'Test fra Delo API',
      html: '<p>Dette er en test av Resend API-tilkobling fra Delo.no</p>'
    });

    if (error) {
      console.error('Resend test error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Resend API error',
          details: error
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Resend test successful:', data);
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Test email sent successfully',
        data: data
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Test API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Unexpected error',
        message: error.message
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}