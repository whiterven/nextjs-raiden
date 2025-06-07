'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface Integration {
  provider: string;
  connected_at: string;
  updated_at: string;
  scopes: string | null;
  expires_at: string | null;
}

interface IntegrationConfig {
  name: string;
  description: string;
  iconPath: string;
  scope: string;
}

const INTEGRATION_CONFIGS: Record<string, IntegrationConfig> = {
  google_drive: {
    name: 'Google Drive',
    description: 'Connect to Google Drive to sync and access your files',
    iconPath: '/icons/google-drive.svg',
    scope: 'drive'
  },
  google_sheets: {
    name: 'Google Sheets',
    description: 'Access and manage your spreadsheets with Google Sheets',
    iconPath: '/icons/google-sheets.svg',
    scope: 'sheets'
  },
  microsoft: {
    name: 'Microsoft OneDrive',
    description: 'Connect to OneDrive for file storage and sharing',
    iconPath: '/icons/onedrive.svg',
    scope: 'files'
  },
  clickup: {
    name: 'ClickUp',
    description: 'Integrate with ClickUp for task and project management',
    iconPath: '/icons/clickup.svg',
    scope: 'all'
  },
  linkedin: {
    name: 'LinkedIn',
    description: 'Share content and connect with your professional network',
    iconPath: '/icons/linkedin.svg',
    scope: 'basic'
  },
  twitter: {
    name: 'Twitter/X',
    description: 'Post updates and engage with your audience on Twitter/X',
    iconPath: '/icons/x-twitter.svg',
    scope: 'basic'
  }
};

export default function IntegrationsManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const successParam = urlParams.get('success');
    const providerParam = urlParams.get('provider');

    if (errorParam) {
      setError(`Connection failed: ${errorParam.replace(/_/g, ' ')}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (successParam && providerParam) {
      setSuccess(`Successfully connected to ${INTEGRATION_CONFIGS[providerParam]?.name || providerParam}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/oauth/status');
      if (!response.ok) {
        throw new Error('Failed to load integrations');
      }
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (err) {
      setError('Failed to load integrations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      window.location.href = `/api/oauth/connect/${provider}?scopes=${INTEGRATION_CONFIGS[provider].scope}`;
    } catch (err) {
      setError('Failed to initiate connection. Please try again.');
      setConnecting(null);
      console.error(err);
    }
  };

  const handleDisconnect = async (provider: string) => {
    try {
      const response = await fetch(`/api/oauth/disconnect/${provider}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }
      
      setSuccess(`Successfully disconnected from ${INTEGRATION_CONFIGS[provider]?.name || provider}`);
      // Refresh the integrations list
      fetchIntegrations();
    } catch (err) {
      setError('Failed to disconnect. Please try again.');
      console.error(err);
    }
  };

  const isConnected = (provider: string) => {
    return integrations.some(integration => integration.provider === provider);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect to external services to enhance your workflow.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="mb-3 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(INTEGRATION_CONFIGS).map(([provider, config]) => {
          const connected = isConnected(provider);
          
          return (
            <Card key={provider} className="overflow-hidden border border-muted">
              <CardHeader className="bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <Image 
                        src={config.iconPath} 
                        alt={config.name} 
                        width={20} 
                        height={20} 
                        className="object-contain"
                      />
                    </div>
                    <span className="truncate">{config.name}</span>
                    {connected && (
                      <Badge variant="outline" className="ml-1 text-[10px] py-0 h-4 bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                        Connected
                      </Badge>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 h-8">{config.description}</p>
                
                <div className="flex justify-end">
                  {connected ? (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDisconnect(provider)}
                      className="flex items-center gap-1 h-7 text-xs px-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="whitespace-nowrap">Disconnect</span>
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleConnect(provider)}
                      disabled={connecting === provider}
                      className="h-7 text-xs px-2"
                    >
                      <span className="whitespace-nowrap">Connect</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 