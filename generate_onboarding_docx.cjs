const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ShadingType } = require('docx');

const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: {
          top: 1440, // 1 inch
          right: 1440,
          bottom: 1440,
          left: 1440,
        },
      },
    },
    children: [
      // Title
      new Paragraph({
        text: "CLIENT WEBSITE ONBOARDING & SPECIFICATION FORM",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, before: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Website Project Intake Form for Cinematic Videography & Flash Shoot Business", italic: true, size: 22, color: "555555" }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // Introduction
      new Paragraph({
        children: [
          new TextRun({ text: "Please complete this form and return it with your brand assets (logos, images, videos) to help us build your fully custom, high-converting website.", size: 22 }),
        ],
        spacing: { after: 400 },
      }),

      // SECTION 1: BUSINESS & BRAND IDENTITY
      new Paragraph({
        text: "SECTION 1: BUSINESS & BRAND IDENTITY",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      }),

      createFormFieldTable([
        ["1. Official Business Name", "__________________________________________________________"],
        ["2. Tagline / Slogan", "__________________________________________________________"],
        ["3. Primary Business Type", "[ ] Videography & Cinema  [ ] Flash Photography  [ ] Wedding Films\n[ ] Commercial Ads  [ ] High-Fashion Editorial  [ ] Drone Cinema"],
        ["4. Brand Colors (Hex / Names)", "Primary: ____________________  Accent: ____________________"],
        ["5. Preferred Font Styles", "[ ] Modern Sans-Serif  [ ] Elegant Serif  [ ] High-End Luxury  [ ] Bold Minimalist"],
        ["6. Logo Files Available", "[ ] Vector (.AI / .SVG)  [ ] High-Res PNG (Transparent)  [ ] JPG  [ ] Needs Logo Design"]
      ]),

      // SECTION 2: CONTACT & STUDIO LOCATIONS
      new Paragraph({
        text: "SECTION 2: CONTACT & STUDIO LOCATIONS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 150 },
      }),

      createFormFieldTable([
        ["1. Primary Contact Name", "__________________________________________________________"],
        ["2. Job Title / Role", "__________________________________________________________"],
        ["3. Official Email Address(es)", "Primary: ____________________  Bookings: ____________________"],
        ["4. Phone Numbers (Calls / SMS)", "Mobile/WhatsApp: ____________________ Studio Office: ____________________"],
        ["5. Physical Studio Address(es)", "Studio 1: __________________________________________________\nStudio 2: __________________________________________________"],
        ["6. Operating Hours & Timezones", "Timezones: [ ] PST  [ ] EST  [ ] CST  [ ] MST  [ ] International\nHours: ___________________________________________________"]
      ]),

      // SECTION 3: SERVICES & PACKAGES
      new Paragraph({
        text: "SECTION 3: SERVICES & PACKAGE PRICING",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 150 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: "List the services/packages you offer to clients along with base pricing ($ USD or local currency):", size: 20, italic: true }),
        ],
        spacing: { after: 200 },
      }),

      createServiceTable(),

      // SECTION 4: MEDIA & PORTFOLIO ASSETS
      new Paragraph({
        text: "SECTION 4: MEDIA & PORTFOLIO ASSETS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 150 },
      }),

      createFormFieldTable([
        ["1. Cloud Link to Logos & Images", "Google Drive / Dropbox Link:\n__________________________________________________________"],
        ["2. Sample Portfolio Videos", "Vimeo / YouTube / Drive Links:\n1. ________________________________________________________\n2. ________________________________________________________"],
        ["3. Director & Team Bios", "Director Name(s): __________________________________________\nAwards / Bio summary: _____________________________________"],
        ["4. Featured Client Logos / Brands", "Brands worked with: ________________________________________"]
      ]),

      // SECTION 5: TECHNICAL & WEBSITE FEATURES
      new Paragraph({
        text: "SECTION 5: TECHNICAL & WEBSITE FEATURES",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 150 },
      }),

      createFormFieldTable([
        ["1. Desired Website Domain", "www.__________________________________________________.com"],
        ["2. Existing Website (if any)", "www.__________________________________________________.com"],
        ["3. Social Media Links", "Instagram: @__________________  YouTube: __________________\nVimeo: ______________________  TikTok: @__________________"],
        ["4. Required Interactive Features", "[ ] Online Calendar Booking Scheduler  [ ] Instant Timezone Slot Converter\n[ ] Live Package Quote Builder  [ ] Authenticated Client Portal & Proofing\n[ ] AI Consultation Bot  [ ] Video/Photo Lightbox Gallery"]
      ]),

      // SECTION 6: ADDITIONAL INSTRUCTIONS
      new Paragraph({
        text: "SECTION 6: ADDITIONAL NOTES & SPECIAL INSTRUCTIONS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 150 },
      }),

      createFormFieldTable([
        ["Notes / Inspiration Websites", "Inspiration Sites You Like: _________________________________\n\nSpecial Requests:\n__________________________________________________________\n__________________________________________________________"]
      ]),

      // Sign-off
      new Paragraph({
        children: [
          new TextRun({ text: "\nCompleted By: ___________________________   Date: _______________", bold: true, size: 22 }),
        ],
        spacing: { before: 300, after: 100 },
      })
    ],
  }],
});

function createFormFieldTable(rowsData) {
  const tableRows = rowsData.map(([label, inputArea]) => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 3000, type: WidthType.DXA },
          shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
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

function createServiceTable() {
  return new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({ shading: { fill: "10B981" }, children: [new Paragraph({ children: [new TextRun({ text: "Package / Service Name", bold: true, color: "FFFFFF", size: 20 })] })] }),
          new TableCell({ shading: { fill: "10B981" }, children: [new Paragraph({ children: [new TextRun({ text: "Base Price ($)", bold: true, color: "FFFFFF", size: 20 })] })] }),
          new TableCell({ shading: { fill: "10B981" }, children: [new Paragraph({ children: [new TextRun({ text: "Duration / Deliverables Included", bold: true, color: "FFFFFF", size: 20 })] })] }),
        ]
      }),
      ...[1, 2, 3, 4, 5].map(i => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: `Package ${i}: __________________` })] }),
          new TableCell({ children: [new Paragraph({ text: `$ ____________` })] }),
          new TableCell({ children: [new Paragraph({ text: `____________________________________` })] }),
        ]
      }))
    ]
  });
}

Packer.toBuffer(doc).then((buffer) => {
  const outputPath = path.join(__dirname, 'Client_Website_Onboarding_Form.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('Successfully created Word document at:', outputPath);
});
