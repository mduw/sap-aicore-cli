/**
 * Generate-template command plugin
 * Creates a sample template directory with all necessary files
 */

import { mkdir, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import type { Argv, ArgumentsCamelCase } from 'yargs';
import type { CommandPlugin } from '../types/command';
import { logger } from '../utils/logger';
import { CommandNames } from './index';

interface GenerateTemplateOptions {
  name: string;
  outputDir: string;
}

/**
 * Generate-template command - uses yargs for parsing
 */
class GenerateTemplateCommand implements CommandPlugin {
  name = CommandNames.GENERATE_TEMPLATE;

  builder(yargs: Argv): Argv {
    return yargs
      .option('name', {
        describe: 'Template name',
        type: 'string',
        demandOption: true,
        requiresArg: true
      })
      .option('output', {
        describe: 'Output directory (default: current directory)',
        type: 'string',
        default: ''
      })
      .example('$0 gen-prompt-template --name my-template', 'Generate a new template sample')
      .example('$0 gen-prompt-template --name my-template --output ./custom-templates', 'Generate template in specific directory');
  }

  async run(args: ArgumentsCamelCase<any>): Promise<void> {
    const config: GenerateTemplateOptions = {
      name: args.name as string,
      outputDir: args.output as string
    };

    await this.execute(config);
  }

  private async execute(config: GenerateTemplateOptions): Promise<void> {
    logger.banner('Generating Template Sample');

    // Determine output directory
    const outputDir = config.outputDir
      ? resolve(config.outputDir, config.name)
      : resolve(process.cwd(), config.name);

    logger.info(`📁 Creating template directory: ${outputDir}\n`);
    logger.debug(`Full path: ${outputDir}`);

    try {
      // Create directory
      await mkdir(outputDir, { recursive: true });
      logger.debug(`Created directory: ${outputDir}`);

      // Generate files
      await this.generatePromptYaml(outputDir, config.name);
      await this.generateSystemPrompt(outputDir);
      await this.generateUserPrompt(outputDir);
      await this.generateReadme(outputDir, config.name);

      logger.info('\n✅ Template sample generated successfully!');
      logger.info(`\n📂 Template location: ${outputDir}`);
      logger.info('\n📝 Next steps:');
      logger.info('   1. Edit the markdown files with your prompt content');
      logger.info('   2. Update prompt.yaml with your configuration');
      logger.info(`   3. Test: saic-cli create-prompt --dir ${outputDir} --dry-run`);
      logger.info(`   4. Create: saic-cli create-prompt --dir ${outputDir}`);

    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to generate template: ${err.message}`);
      throw error;
    }
  }

  private async generatePromptYaml(dir: string, name: string): Promise<void> {
    const content = `# Prompt Configuration
name: ${name.toUpperCase().replace(/-/g, '_')}
version: 1.0.0
scenario: MY_SCENARIO

spec:
  # Template roles with markdown file references
  template:
    - role: system
      contentFile: ./system-prompt.md

    - role: user
      contentFile: ./user-prompt.md

  # Variable definitions
  variable_definition:
    InputText: ""
    OutputFormat: ""

  # Additional configuration
  additional_fields:
    executableId: azure-openai
    llmName: gpt-4o

# Metadata (optional, for documentation)
metadata:
  description: Sample prompt template for ${name}
  author: Your Name
  tags:
  created: ${new Date().toISOString().split('T')[0]}
`;

    const filePath = join(dir, 'prompt.yaml');
    await writeFile(filePath, content, 'utf-8');
    logger.info('   ✓ Created prompt.yaml');
    logger.debug(`     ${filePath}`);
  }

  private async generateSystemPrompt(dir: string): Promise<void> {
    const content = `## Identity
You are an AI assistant helping with [DESCRIBE YOUR TASK HERE].

## Instructions
[PROVIDE DETAILED INSTRUCTIONS FOR THE AI]

### Input Format
The input will be provided in the following format:
- Input Text: {{?InputText}}
- Output Format: {{?OutputFormat}}

### Output Requirements
1. Be clear and concise
2. Follow the specified output format
3. Maintain professional tone

## Constraints
- Do not include any personal information
- Stay focused on the task
- If unsure, ask for clarification

## Examples
[PROVIDE EXAMPLES OF EXPECTED INPUT/OUTPUT]
`;

    const filePath = join(dir, 'system-prompt.md');
    await writeFile(filePath, content, 'utf-8');
    logger.info('   ✓ Created system-prompt.md');
    logger.debug(`     ${filePath}`);
  }

  private async generateUserPrompt(dir: string): Promise<void> {
    const content = `## Task Request

Please process the following input:

**Input Text:**
{{?InputText}}

**Desired Output Format:**
{{?OutputFormat}}

---

Please provide your response according to the instructions.
`;

    const filePath = join(dir, 'user-prompt.md');
    await writeFile(filePath, content, 'utf-8');
    logger.info('   ✓ Created user-prompt.md');
    logger.debug(`     ${filePath}`);
  }

  private async generateReadme(dir: string, name: string): Promise<void> {
    const content = `# ${name} Template

This is a sample prompt template generated by the SAP AI Prompt CLI.

## Structure

\`\`\`
${name}/
├── prompt.yaml           # Main configuration file
├── system-prompt.md      # System role instructions
├── user-prompt.md        # User role prompt template
└── README.md            # Guidelines on using and customizing the template
\`\`\`

## Configuration Files

### prompt.yaml
Main configuration file containing:
- **Metadata**: Name, version, scenario
- **Template references**: Links to markdown files
- **Variable Definition**: Template variables
- **Additional fields**: LLM configuration

### system-prompt.md
Contains the system role instructions that define the AI's behavior and responsibilities.

### user-prompt.md
User role prompt template with variable placeholders like \`{{InputText}}\`.

## Template Variables

The following variables are used in the prompts:

- \`{{InputText}}\`: The main input text to process
- \`{{OutputFormat}}\`: The desired output format

## Usage

### Test the template (dry run)
\`\`\`bash
saic-cli create-prompt --dir ./templates/${name} --dry-run
\`\`\`

### Create the prompt
\`\`\`bash
saic-cli create-prompt --dir ./templates/${name}
\`\`\`

### With verbose output
\`\`\`bash
saic-cli create-prompt --dir ./templates/${name} --verbose
\`\`\`

## Customization

1. **Edit system-prompt.md**: Define the AI's behavior and instructions
2. **Edit user-prompt.md**: Create the task request template
3. **Update prompt.yaml**:
   - Change name, version, scenario
   - Add/modify variable definitions
   - Update LLM settings
4. **Test before deploying**: Always use \`--dry-run\` first

## Best Practices

1. ✅ Use clear variable names (e.g., \`InputText\`, not \`x\`)
2. ✅ Document all variables in README
3. ✅ Use semantic versioning (1.0.0, 1.1.0, etc.)
4. ✅ Test with \`--dry-run\` before creating
5. ✅ Keep prompts focused on a single task

## Troubleshooting

### Error: "Config file not found"
- Ensure \`prompt.yaml\` exists in the template directory

### Error: "Markdown file not found"
- Verify \`contentFile\` paths in \`prompt.yaml\` are correct
- Paths should be relative to \`prompt.yaml\`

### Error: "Missing required fields"
- Ensure name, version, and scenario are specified in \`prompt.yaml\`
- Check that \`executableId\` and \`llmName\` are in \`additional_fields\`

## Resources

- [SAP AI Core Documentation](https://help.sap.com/docs/sap-ai-core)
- [YAML Syntax Guide](https://yaml.org/spec/)
- [Markdown Guide](https://www.markdownguide.org/)
`;

    const filePath = join(dir, 'README.md');
    await writeFile(filePath, content, 'utf-8');
    logger.info('   ✓ Created README.md');
    logger.debug(`     ${filePath}`);
  }
}

export default new GenerateTemplateCommand();
