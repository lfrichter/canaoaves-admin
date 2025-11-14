"use client";

import { useShow } from "@refinedev/core";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfileShow() {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <ShowView>
      <ShowViewHeader title={record?.email} />
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Perfil</CardTitle>
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
                <div className="font-bold">Email</div>
                <div>{record?.email}</div>
              </div>
              <div>
                <div className="font-bold">Role</div>
                <div>{record?.app_role}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ShowView>
  );
}
