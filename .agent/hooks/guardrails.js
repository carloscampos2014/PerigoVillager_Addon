// agentfiles · Antigravity PreToolUse guardrails
let buffer = '';
process.stdin.on('data', chunk => { buffer += chunk; });
process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(buffer);
    const cmd = (payload.toolCall && payload.toolCall.args && payload.toolCall.args.CommandLine) || '';
    const isDangerous = /git\s+push\s+--force|git\s+push\s+-f|git\s+reset\s+--hard|git\s+clean\s+-f|git\s+push\s+.*origin\s+(main|master)|rm\s+-rf\s+\/(?!tmp)/i.test(cmd);
    if (isDangerous) {
      console.log(JSON.stringify({
        decision: 'deny',
        reason: 'Comando bloqueado pelos guardrails de segurança do agentfiles.'
      }));
      return;
    }
  } catch (e) {}
  console.log(JSON.stringify({ decision: 'allow' }));
});

