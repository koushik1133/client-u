const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType } = require('docx');

const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: {
          top: 1440,
          right: 1440,
          bottom: 1440,
          left: 1440,
        },
      },
    },
    children: [
      // Title
      new Paragraph({
        text: "VIK HUB - WEBSITE ONBOARDING FORM",
        heading: HeadingLevel.HEADING_1,
        alignment: 1, // Center
        spacing: { after: 150, before: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Quick & Easy Project Setup Questionnaire", italic: true, size: 22, color: "10B981" }),
        ],
        alignment: 1,
        spacing: { after: 350 },
      }),

      // Friendly intro
      new Paragraph({
        children: [
          new TextRun({ text: "Welcome to VIK Hub! Please answer the simple questions below so we can start building your website. Don't worry if you don't have all the details yet—just fill in what you can!", size: 20 }),
        ],
        spacing: { after: 300 },
      }),

      // 1. YOUR BUSINESS
      new Paragraph({
        text: "1. BUSINESS DETAILS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 250, after: 150 },
      }),
      createSimpleTable([
        ["Business / Brand Name", "__________________________________________________________"],
        ["What does your business do?", "__________________________________________________________"],
        ["Tagline or Motto (optional)", "__________________________________________________________"]
      ]),

      // 2. CONTACT INFO
      new Paragraph({
        text: "2. CONTACT INFORMATION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }),
      createSimpleTable([
        ["Your Full Name", "__________________________________________________________"],
        ["Phone / WhatsApp Number", "__________________________________________________________"],
        ["Email Address", "__________________________________________________________"],
        ["Location / Address / City", "__________________________________________________________"]
      ]),

      // 3. WEBSITE PAGES & SERVICES
      new Paragraph({
        text: "3. WEBSITE PAGES & SERVICES",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }),
      createSimpleTable([
        ["Which pages do you need?", "[ ] Home   [ ] About Us   [ ] Services / Products\n[ ] Portfolio / Gallery   [ ] Contact Us   [ ] Blog / News"],
        ["List your main services or products", "1. ______________________________________________________\n2. ______________________________________________________\n3. ______________________________________________________"]
      ]),

      // 4. LOGO & BRAND COLORS
      new Paragraph({
        text: "4. LOGO & BRAND COLORS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }),
      createSimpleTable([
        ["Do you have a Logo?", "[ ] Yes (Attach PNG/SVG)   [ ] No (Need a basic logo)"],
        ["Preferred Colors for Website", "Primary Color: __________________ Secondary: __________________"],
        ["Link to your photos / files", "Google Drive / Dropbox Link:\n__________________________________________________________"]
      ]),

      // 5. NOTES & EXAMPLES
      new Paragraph({
        text: "5. EXAMPLES & SPECIAL REQUESTS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }),
      createSimpleTable([
        ["Websites you like for reference", "1. ______________________________________________________\n2. ______________________________________________________"],
        ["Any extra features needed?", "[ ] Online Booking / Appointment Calendar   [ ] Contact Form\n[ ] WhatsApp Chat Button   [ ] Social Media Links"],
        ["Any additional notes for us", "__________________________________________________________\n__________________________________________________________"]
      ]),

      // Footer
      new Paragraph({
        children: [
          new TextRun({ text: "\nThank you for choosing VIK Hub! We look forward to building your website.", italic: true, bold: true, size: 20 }),
        ],
        alignment: 1,
        spacing: { before: 300 },
      })
    ],
  }],
});

function createSimpleTable(rowsData) {
  const tableRows = rowsData.map(([label, inputArea]) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          shading: { fill: "F3F4F6" },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
        }),
        new TableCell({
          width: { size: 6000, type: WidthType.DXA },
          children: inputArea.split('\n').map(line => new Paragraph({ children: [new TextRun({ text: line, size: 20 })] })),
        }),
      ],
    });
  });

  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: tableRows,
  });
}

Packer.toBuffer(doc).then((buffer) => {
  const outputPath = path.join(__dirname, 'VIK_Hub_Website_Onboarding_Form.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('Successfully created Word document at:', outputPath);
});
