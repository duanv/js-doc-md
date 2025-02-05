import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import jsdoc2md from 'jsdoc-to-markdown';
import { anchorNameLower } from './helpers/anchor-name-lower.js';

const headerTemplate = path.resolve('./partial/header.hbs');

export const writeReadme = (filename, root, toConsole, regex, force) => {
  return new Promise((resolve, reject) => {
    const basename = path.parse(filename).name;
    const readme = `${path.dirname(filename)}/${basename === 'index' ? 'readme' : basename}.md`;
    let doc;

    try {
      doc = jsdoc2md.renderSync({ files: filename, 'global-index-format': 'grouped', helper: [anchorNameLower], partial: [headerTemplate] });
    } catch (e) {
      reject('Error');
      return;
    }

    if(doc) {
      if (toConsole) {
        console.log(chalk.gray(`Doc for ${filename}:`))
        console.log('<!-- js-doc-md-start -->\n' + doc + '<!-- js-doc-md-end -->\n\n');
        resolve('Success');
      } else {
        try {
          let readmeContent = '';
          let newContent = '';
          let fileExists = false;

          if (!fs.existsSync(readme)) {
            console.warn(chalk.yellow(`${readme} not found and will be created`));
          } else {
            readmeContent = fs.readFileSync(path.resolve(process.cwd(), readme), 'utf-8');
            fileExists = true;
          }

          if (readmeContent.match(regex)) {
            newContent = readmeContent.replace(
              regex,
              '<!-- js-doc-md-start -->\n' + doc + '<!-- js-doc-md-end -->'
            );
          } else if (force || !fileExists) {
            newContent = '<!-- js-doc-md-start -->\n' + doc + '<!-- js-doc-md-end -->';
          }

          if (newContent) {
            try {
              fs.writeFileSync(readme, newContent, 'utf-8');

              console.log(chalk.green(`${readme} updated successfully.`));
              resolve('Success');
            } catch (e) {
              console.error(chalk.red(`Error updating ${readme}: ${e}`));
              reject('Error');
            }
          } else {
            console.warn(
              chalk.yellow(`Could not find content to replace in ${readme}`),
              '\nThe documentation needs to be wrapped between <!-- js-doc-md-start --> and <!-- js-doc-md-end -->',
              '\nor use with --force to overwrite the file'
            );
            reject('Warning');
          }
        } catch (e) {
          console.error(chalk.red(`Error updating ${readme}: ${e}`));
          reject('Error');
        }
      }
    } else {
      resolve('Ignored');
    }
  });
};
