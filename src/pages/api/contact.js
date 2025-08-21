import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Alle obligatoriske felt må fylles ut' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map subject values to Norwegian
    const subjectMap = {
      'general': 'Generell henvendelse',
      'article-suggestion': 'Forslag til artikkel',
      'financial-question': 'Spørsmål om økonomi',
      'website-feedback': 'Tilbakemelding på nettside',
      'other': 'Annet'
    };

    const subjectText = subjectMap[subject] || subject;

    const { data, error } = await resend.emails.send({
      from: 'Delo Kontaktskjema <noreply@delo.no>',
      to: ['morten@trase.no'],
      subject: `Ny henvendelse fra Delo: ${subjectText}`,
      html: `
        <h2>Ny henvendelse fra Delo.no</h2>
        <p><strong>Navn:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <p><strong>Emne:</strong> ${subjectText}</p>
        <p><strong>Melding:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Sendt fra Delo.no kontaktskjema</small></p>
      `,
      text: `
        Ny henvendelse fra Delo.no
        
        Navn: ${name}
        E-post: ${email}
        Emne: ${subjectText}
        
        Melding:
        ${message}
        
        ---
        Sendt fra Delo.no kontaktskjema
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Kunne ikke sende e-post. Prøv igjen senere.' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Takk for din henvendelse! Vi svarer normalt innen 24 timer.' }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'En uventet feil oppstod. Prøv igjen senere.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}