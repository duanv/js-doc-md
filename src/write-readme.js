const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const jsdoc2md = require('jsdoc-to-markdown');

const writeReadme = (filename, root, toConsole, regex, force) => {
  return new Promise(async(resolve, reject) => {
    const basename = path.parse(filename).name;
    const readme = `${path.dirname(filename)}/${basename === 'index' ? 'readme' : basename}.md`;

    return jsdoc2md.render({ files: filename })
      .then((doc) => {
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
        }
      })
      .catch((e) => {
        console.error(chalk.red(`Error updating ${readme}: ${e}`));
        reject('Error');
      });
  });
};

module.exports = writeReadme;
