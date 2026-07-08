import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, RefreshCcw, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { logsApi } from '@/services/api';

type LogLevel = 'all' | 'debug' | 'info' | 'warn' | 'warning' | 'error';

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  details?: unknown;
}

const getString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' && value.trim() ? value : fallback;
};

const normalizeLog = (value: unknown, index: number): LogEntry => {
  if (!value || typeof value !== 'object') {
    return {
      id: String(index),
      timestamp: new Date().toISOString(),
      level: 'info',
      source: 'system',
      message: String(value ?? ''),
    };
  }

  const record = value as Record<string, unknown>;
  const timestamp = getString(record.timestamp, getString(record.time, getString(record.createdAt, new Date().toISOString())));
  const message = getString(record.message, getString(record.description, JSON.stringify(record)));

  return {
    id: getString(record.id, `${timestamp}-${index}`),
    timestamp,
    level: getString(record.level, getString(record.severity, 'info')).toLowerCase(),
    source: getString(record.source, getString(record.service, getString(record.agentName, 'system'))),
    message,
    details: record.details ?? record.meta ?? record.context,
  };
};

const levelVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' => {
  if (level === 'error') return 'destructive';
  if (level === 'warn' || level === 'warning') return 'warning';
  if (level === 'debug') return 'outline';
  if (level === 'info') return 'secondary';
  return 'default';
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString();
};

const SystemLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [level, setLevel] = useState<LogLevel>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await logsApi.getLogs({
        level: level === 'all' ? undefined : level,
        search: search || undefined,
        limit: 200,
      });
      setLogs(data.map(normalizeLog));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesLevel = level === 'all' || log.level === level;
      const matchesSearch =
        !query ||
        log.message.toLowerCase().includes(query) ||
        log.source.toLowerCase().includes(query) ||
        log.level.toLowerCase().includes(query);

      return matchesLevel && matchesSearch;
    });
  }, [level, logs, search]);

  const clearLogs = async () => {
    await logsApi.clearLogs();
    setLogs([]);
  };

  const downloadLogs = async () => {
    const blob = await logsApi.downloadLogs();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system-logs.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Logs</h1>
          <p className="text-sm text-muted-foreground">System events, warnings, and errors</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={downloadLogs}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="destructive" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            System Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <Select value={level} onValueChange={(value) => setLevel(value as LogLevel)}>
              <SelectTrigger>
                <SelectValue placeholder="Log level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search logs"
            />
          </div>

          <div className="rounded-md border">
            {loading ? (
              <div className="p-6 text-sm text-muted-foreground">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No logs found.</div>
            ) : (
              <div className="divide-y">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={levelVariant(log.level)}>{log.level}</Badge>
                      <span>{formatTimestamp(log.timestamp)}</span>
                      <span>{log.source}</span>
                    </div>
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">
                      {log.message}
                    </pre>
                    {log.details !== undefined && (
                      <pre className="whitespace-pre-wrap break-words rounded-md bg-muted p-3 font-mono text-xs text-muted-foreground">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogsPage;
