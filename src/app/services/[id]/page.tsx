"use client";

import { useShow } from "@refinedev/core";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ServiceShow() {
  const { query } = useShow();
  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <ShowView>
      <ShowViewHeader title={record?.name} />
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Carregando...</div>
          ) : (
            <div className="grid gap-4">
              <div>
                <div className="font-bold">ID</div>
                <div>{record?.id}</div>
              </div>
              <div>
                <div className="font-bold">Nome</div>
                <div>{record?.name}</div>
              </div>
              <div>
                <div className="font-bold">Descrição</div>
                <div>{record?.description}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ShowView>
  );
}
