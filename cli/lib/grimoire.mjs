import ora from 'ora';

export const AnCreate = (program, exec, fs, path, fse, chalk) => {
  program
    .command('make <file> [path]')
    .description('Create a new file or folder.')
    .action((file, inputPath) => {
      const pathMappings = {
        controller: path.join('app', 'controllers'),
        model: path.join('app', 'models'),
        migration: path.join('database', 'migrations'),
      };

      let destinationPath = pathMappings[file];

      if (!destinationPath) {
        const similarCommands = Object.keys(pathMappings).filter((key) =>
          key.includes(file) || file.includes(key)
        );
        const didYouMean =
          similarCommands.length > 0 ? `did you mean: ${similarCommands.join(', ')}` : '';
        console.error(`unknown command: make ${file} not found. ${didYouMean}`);
        return;
      }

      if (inputPath && !inputPath.endsWith('.php')) {
        inputPath += '.php';
      }

      const pathParts = inputPath.split('/');
      const fileName = pathParts.pop();
      const subfolder = pathParts.join('/');
      const fullPath = path.join(destinationPath, fileName);

      if (fs.existsSync(fullPath)) {
        console.error(`${file} ${fileName} already exists.`);
        return;
      }

      const modelFilePath = `stacker/${file}.php`;
      const modelContent = fs.readFileSync(modelFilePath, 'utf8');
      const newFileName = path.basename(fileName, '.php');
      const modifiedContent = modelContent.replace(/base/gi, newFileName);

      const loadingSpinner = ora(`Creating ${file} ${fileName}...`).start();

      if (subfolder) {
        destinationPath = path.join(destinationPath, subfolder);
        if (!fs.existsSync(destinationPath)) {
          fse.ensureDirSync(destinationPath);
        }
      }

      fs.writeFileSync(fullPath, modifiedContent);

      loadingSpinner.succeed(
        `${chalk.white(file)} ${chalk.cyan(fileName)} ${chalk.greenBright(
          'successfully'
        )} added in ${chalk.yellow(fullPath)}`
      );
    });
};

export default AnCreate;
