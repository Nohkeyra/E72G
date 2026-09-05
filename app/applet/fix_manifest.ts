import fs from 'fs';

const path = '/app/applet/src/modules/typography/referenceImageManifest.ts';
let content = fs.readFileSync(path, 'utf8');

const idsToRemoveLines = ["HB_01", "HB_02", "HB_03", "HB_04", "HB_05", "HB_06", "HB_07", "HB_08", "PX_01"];

idsToRemoveLines.forEach(id => {
  const regex = new RegExp(`(id: "${id}".*?)previewImagePath: ".*?", referenceImagePath: ".*?", `, 'g');
  content = content.replace(regex, '$1');
});

fs.writeFileSync(path, content);
