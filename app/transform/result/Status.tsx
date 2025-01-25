import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ResultCard({
  originalFileName,
  success,
  message,
}: {
  originalFileName: string;
  success: boolean;
  message: string;
}) {
  return (
    <Card className="mb-4">
      <CardContent className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{originalFileName}</h3>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`${
              success
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {success ? 'Success' : 'Failed'}
          </Badge>
          {success ? (
            <CheckCircle className="text-green-500 w-6 h-6" />
          ) : (
            <XCircle className="text-red-500 w-6 h-6" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
