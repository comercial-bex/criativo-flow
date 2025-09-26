import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Palette } from "lucide-react";

export default function DesignBiblioteca() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="h-8 w-8 text-primary" />
            Biblioteca de Assets
          </h1>
          <p className="text-muted-foreground">Repositório de criativos e templates</p>
        </div>
        <Button>
          <Palette className="h-4 w-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Biblioteca de assets em desenvolvimento</p>
        </CardContent>
      </Card>
    </div>
  );
}