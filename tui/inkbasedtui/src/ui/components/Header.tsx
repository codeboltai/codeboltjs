/**
 * Header component displaying app title and version
 */

import React from 'react';
import { Box, Text } from 'ink';

export function Header() {
  return (
    <Box borderStyle="single" borderColor="blue" paddingX={1}>
      <Box flexDirection="column" alignItems="center" width="100%">
        <Text color="blue" bold>
          ╔═══════════════════════════════════════════════════════════════╗
        </Text>
        <Text color="blue" bold>
          ║                    CODEBOLT CLI v0.1.0                        ║
        </Text>
        <Text color="blue" bold>
          ╚═══════════════════════════════════════════════════════════════╝
        </Text>
      </Box>
    </Box>
  );
}
