import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import {
  CaseSensitive,
  Regex,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
} from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { useUIStore } from '@/stores/uiStore';

interface SearchResult {
  file_path: string;
  line_number: number;
  line_content: string;
  match_start: number;
  match_end: number;
}

interface GroupedResults {
  filePath: string;
  fileName: string;
  results: SearchResult[];
  collapsed: boolean;
}

interface SearchPanelProps {
  currentDirectory: string | null;
  query: string;
}

export function SearchPanel({ currentDirectory, query }: SearchPanelProps) {
  const { t } = useTranslation();
  const loadDocument = useDocumentStore((state) => state.loadDocument);
  const setSidebarVisible = useUIStore((state) => state.setSidebarVisible);

  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [groups, setGroups] = useState<GroupedResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(
    async (rawQuery: string) => {
      const normalizedQuery = rawQuery.trim();
      if (!normalizedQuery || !currentDirectory) {
        setResults([]);
        setGroups([]);
        setSearched(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await invoke<SearchResult[]>('search_in_files', {
          root: currentDirectory,
          query: normalizedQuery,
          caseSensitive,
          useRegex,
        });
        setResults(res);

        const groupedMap = new Map<string, SearchResult[]>();
        for (const result of res) {
          const existing = groupedMap.get(result.file_path) ?? [];
          existing.push(result);
          groupedMap.set(result.file_path, existing);
        }

        const nextGroups: GroupedResults[] = [];
        groupedMap.forEach((groupResults, filePath) => {
          nextGroups.push({
            filePath,
            fileName: filePath.split('/').pop() ?? filePath,
            results: groupResults,
            collapsed: false,
          });
        });

        setGroups(nextGroups);
        setSearched(true);
      } catch (searchError) {
        setError(String(searchError));
        setResults([]);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    },
    [caseSensitive, currentDirectory, useRegex],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void runSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, caseSensitive, useRegex, runSearch]);

  const toggleCollapse = (filePath: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.filePath === filePath
          ? { ...group, collapsed: !group.collapsed }
          : group,
      ),
    );
  };

  const handleResultClick = async (result: SearchResult) => {
    try {
      await loadDocument(result.file_path);
      setSidebarVisible(true);
    } catch (openError) {
      console.error('Failed to open file from search:', openError);
    }
  };

  const highlightMatch = (line: string, start: number, end: number) => {
    const safeStart = Math.max(0, start);
    const safeEnd = Math.max(safeStart, end);
    const before = line.slice(0, safeStart);
    const match = line.slice(safeStart, safeEnd);
    const after = line.slice(safeEnd);

    const maxLen = 80;
    const trimBefore = before.length > 30 ? `…${before.slice(-30)}` : before;
    const allowedTail = Math.max(20, maxLen - trimBefore.length - match.length);
    const trimAfter = after.length > allowedTail ? `${after.slice(0, allowedTail)}…` : after;

    return (
      <span className="text-xs font-mono text-foreground/80">
        {trimBefore}
        <mark className="rounded-sm bg-[hsl(var(--sidebar-highlight-bg))] px-0.5 text-inherit">
          {match}
        </mark>
        {trimAfter}
      </span>
    );
  };

  const totalMatches = results.length;
  const totalFiles = groups.length;

  return (
    <section className="sidebar-card mt-3">
      <div className="sidebar-card-header">
        <div className="flex items-center gap-1.5">
          <span className="sidebar-section-title">
            {t('sidebar.results')}
          </span>
          {searched && !loading && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {totalMatches > 0
                ? t('search.result_summary', { matches: totalMatches, files: totalFiles })
                : t('search.no_results')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCaseSensitive((v) => !v)}
            title={t('search.case_sensitive')}
            className={`sidebar-icon-button ${caseSensitive ? 'sidebar-icon-button-active' : ''}`}
          >
            <CaseSensitive className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setUseRegex((v) => !v)}
            title={t('search.use_regex')}
            className={`sidebar-icon-button ${useRegex ? 'sidebar-icon-button-active' : ''}`}
          >
            <Regex className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="sidebar-card-content">
        {!currentDirectory && (
          <p className="px-2 py-2 text-xs text-muted-foreground">
            {t('search.open_folder_first')}
          </p>
        )}

        {error && (
          <div className="mx-2 mb-2 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">{t('common.loading')}</span>
          </div>
        )}

        {!loading && currentDirectory && groups.length > 0 && (
          <div className="px-1 pb-2">
            {groups.map((group) => (
              <div key={group.filePath} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleCollapse(group.filePath)}
                  className="sidebar-row w-full text-left"
                >
                  {group.collapsed ? (
                    <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  )}
                  <FileText className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-xs font-medium" title={group.filePath}>
                    {group.fileName}
                  </span>
                  <span className="rounded bg-muted px-1 text-[10px] text-muted-foreground">
                    {group.results.length}
                  </span>
                </button>

                {!group.collapsed && (
                  <div className="ml-4">
                    {group.results.map((result, idx) => {
                      const trimLeading = result.line_content.length - result.line_content.trimStart().length;
                      return (
                        <button
                          key={`${result.file_path}-${result.line_number}-${idx}`}
                          type="button"
                          onClick={() => handleResultClick(result)}
                          className="sidebar-row w-full text-left"
                        >
                          <span className="w-8 flex-shrink-0 text-right font-mono text-xs text-muted-foreground">
                            {result.line_number}
                          </span>
                          <span className="min-w-0 flex-1 overflow-hidden">
                            {highlightMatch(
                              result.line_content.trimStart(),
                              result.match_start - trimLeading,
                              result.match_end - trimLeading,
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && searched && currentDirectory && groups.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            {t('search.no_results')}
          </p>
        )}
      </div>
    </section>
  );
}
