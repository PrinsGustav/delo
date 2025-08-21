import fs from 'fs';
import path from 'path';

// Mapping from the WordPress API data
const imageMapping = {
  'drommer-du-om-tid': '4-41.jpg',
  'slik-finner-du-det-beste-og-rimeligste-mobilabonnementet': '4-40.jpg',
  'slik-handterer-du-okonomien-ved-et-samlivsbrudd': '3-37.jpg',
  'hvorfor-fondsinvestering-kan-vaere-et-smart-valg-for-deg': '4-39.jpg',
  'vaer-forberedt-slik-lager-du-en-plan-for-okonomiske-kriser': '4-38.jpg',
  'rimelige-alternativer-for-daglig-transport': '4-37.jpg',
  'slik-holder-du-deg-unna-betalingsanmerkninger-og-opprettholder-god-kreditt': '4-2.png',
  'nar-bor-du-vurdere-a-soke-hjelp-fra-en-okonomisk-radgiver': '4-36.jpg',
  'kom-i-gang-med-aksjeinvestering-en-nybegynnerguide': '4-35.jpg',
  'slik-kan-du-forhandle-deg-til-lavere-husleie': '4-34.jpg',
  'vaer-pa-vakt-slik-gjenkjenner-og-unngar-du-okonomiske-svindler': '4-33.jpg',
  'hvordan-budsjettmaler-kan-forenkle-din-okonomistyring': '4-1.png',
  'slik-setter-og-oppnar-du-dine-okonomiske-mal': '4-32.jpg',
  'beskytt-deg-mot-identitetstyveri-med-disse-tiltakene': '4-30.jpg',
  'hvorfor-en-okonomisk-buffer-er-essensiell-for-din-okonomiske-trygghet': '4-29.jpg',
  'en-nybegynnerguide-til-investering-i-kryptovaluta': '4-28.jpg',
  'slik-kutter-du-ned-pa-unodvendige-abonnementer-og-sparer-penger': '4-27.jpg',
  'slik-forhandler-du-deg-til-hoyere-lonn': '4-26.jpg',
  'er-kontanter-bedre-for-budsjettering-enn-kort': '3-22.jpg',
  'hvordan-unnga-okonomiske-konflikter-i-forhold': '4-24.jpg',
  'studentokonomi-slik-far-du-pengene-til-a-strekke-til': '4-23.jpg',
  'slik-blir-du-kvitt-gjelden-din-raskere': '4-21.jpg',
  'hvorfor-det-kan-lonne-seg-a-ha-flere-inntektskilder': '3-18.jpg',
  'hva-du-bor-vite-for-du-tar-opp-et-forbrukslan': '4.png',
  'er-eiendomsinvestering-riktig-for-deg': '4-17.jpg',
  'lag-en-spareplan-som-fungerer-for-deg': '1-18.jpg',
  'slik-kan-du-kutte-ned-pa-utgiftene-knyttet-til-bilen-din': '1-16.jpg',
  'hva-du-bor-vite-for-du-leier-ut-boligen-din': '4-13.jpg',
  'veien-til-a-spare-opp-egenkapital-for-boligkjop': '2-12.jpg',
  'slik-kan-du-forbedre-kredittscoren-din-pa-kort-tid': '3-12.jpg',
  'steg-for-steg-guide-til-effektiv-pensjonssparing': '1-11.jpg',
  'topp-5-kredittkort-med-de-beste-cashback-avtalene': '2-9.jpg',
  '7-metoder-for-a-kontrollere-impulskjop-og-spare-penger': '2-1.png',
  'hvordan-automatisk-sparing-kan-hjelpe-deg-a-na-dine-okonomiske-mal': '1-8.jpg',
  'nar-og-hvordan-du-bor-refinansiere-boliglanet-ditt': '1-7.jpg',
  'slik-kan-du-kutte-ned-pa-stromforbruket-og-spare-penger': '2-7.jpg',
  'en-nybegynnerguide-til-investering-i-indeksfond': '2-5.jpg',
  'hvorfor-du-bor-vurdere-en-hoyrentekonto-for-sparepengene-dine': '3-4.jpg',
  'strategier-for-rask-nedbetaling-av-kredittkortgjeld': '1-3.jpg',
  'de-5-beste-appene-for-a-holde-styr-pa-okonomien-din': '2-2.jpg',
  '10-tips-for-a-redusere-matutgiftene-dine': '4-1.jpg',
  'slik-lager-du-et-effektivt-husholdningsbudsjett': '4.jpg'
};

const contentDir = './src/content/blog/';

function updateMarkdownFile(filename, newImage) {
  const filePath = path.join(contentDir, filename + '.md');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filename}.md`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the heroImage line
    const heroImageRegex = /heroImage:\s*["']([^"']+)["']/;
    const newHeroImage = `heroImage: "../../assets/blog/wp-originals/${newImage}"`;
    
    if (heroImageRegex.test(content)) {
      content = content.replace(heroImageRegex, newHeroImage);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filename}.md -> ${newImage}`);
    } else {
      console.log(`⚠️ No heroImage found in: ${filename}.md`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filename}.md:`, error.message);
  }
}

function main() {
  console.log('Updating markdown files with correct WordPress images...');
  
  Object.entries(imageMapping).forEach(([slug, image]) => {
    updateMarkdownFile(slug, image);
  });
  
  console.log('\nUpdate complete!');
}

main();