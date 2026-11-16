// Generates a standalone, downloadable A4 landscape PDF without external services.
// PDF standard fonts use Windows-1252 encoding for Portuguese accents.
const cp1252 = value => Array.from(value).map(ch => {
  const n=ch.codePointAt(0);
  const special={0x20ac:128,0x201a:130,0x0192:131,0x201e:132,0x2026:133,0x2020:134,0x2021:135,0x02c6:136,0x2030:137,0x0160:138,0x2039:139,0x0152:140,0x017d:142,0x2018:145,0x2019:146,0x201c:147,0x201d:148,0x2022:149,0x2013:150,0x2014:151,0x02dc:152,0x2122:153,0x0161:154,0x203a:155,0x0153:156,0x017e:158,0x0178:159};
  const byte=n<256?n:(special[n]??63);
  return byte===40||byte===41||byte===92?'\\'+String.fromCharCode(byte):byte<32||byte>126?'\\'+byte.toString(8).padStart(3,'0'):String.fromCharCode(byte);
}).join('');

export function makeCertificatePdf(name,score,date){
  const width=842,height=595;
  const stream=[];
  const write=s=>stream.push(s);
  const text=(value,x,y,size=16,font='F1',color='0.28 0.14 0.37')=>{
    write(`BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm (${cp1252(value)}) Tj ET`);
  };
  const center=(value,y,size=16,font='F1',color)=>{
    // Approximate width for standard Helvetica, sufficient for centered layout.
    const estimated=Array.from(value).reduce((sum,ch)=>sum+(ch===' '?0.28:/[ilI.,:]/.test(ch)?0.25:/[MW]/.test(ch)?0.82:0.53),0)*size;
    text(value,Math.max(40,(width-estimated)/2),y,size,font,color);
  };
  write('0.985 0.967 0.995 rg 0 0 842 595 re f');
  write('0.71 0.48 0.80 RG 3 w 24 24 794 547 re S');
  write('0.94 0.85 0.96 RG 1 w 34 34 774 527 re S');
  const rainbow=['0.92 0.42 0.49','0.94 0.64 0.38','0.92 0.80 0.43','0.48 0.72 0.54','0.47 0.63 0.84','0.69 0.52 0.81'];
  rainbow.forEach((c,i)=>write(`${c} rg ${151+i*90} 491 90 6 re f`));
  center('BellaTech',521,36,'F2','0.48 0.23 0.60');
  center('CERTIFICADO DE CONCLUSÃO',437,26,'F2');
  center('Certificamos que',394,15);
  const clean=name.replace(/\\s+/g,' ').trim();
  const words=clean.split(' '),lines=[''];
  for(const word of words){
    const current=lines.length-1;
    if((lines[current]+' '+word).trim().length>42&&lines[current])lines.push(word);
    else lines[current]=(lines[current]+' '+word).trim();
  }
  const nameSize=lines.some(line=>line.length>35)?22:29;
  lines.slice(0,3).forEach((line,i)=>center(line,351-i*31,nameSize,'F2','0.54 0.25 0.62'));
  const offset=(lines.length-1)*25;
  center('concluiu a jornada demonstrativa de Inglês Profissional da BellaTech,',286-offset,16);
  center('com quatro módulos de aprendizagem e o Desafio Final,',261-offset,16);
  center(`alcançando ${score}/10 pontos na avaliação final.`,236-offset,17,'F2');
  center(`Data de emissão: ${date}   |   BellaTech - Projeto acadêmico`,172-offset,13);
  center('Documento demonstrativo de conclusão. Não constitui certificação oficial',103,11,'F1','0.48 0.42 0.54');
  center('de proficiência em inglês.',86,11,'F1','0.48 0.42 0.54');
  const content=stream.join('\n')+'\n';
  const objects=[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  ];
  let pdf='%PDF-1.4\n',offsets=[0];
  for(let i=0;i<objects.length;i++){offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}
  const xref=pdf.length;
  pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(n=>{pdf+=String(n).padStart(10,'0')+' 00000 n \n';});
  pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([new Uint8Array(Array.from(pdf,c=>c.charCodeAt(0)))],{type:'application/pdf'});
}
