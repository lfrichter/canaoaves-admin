"use client";

import type { DataProvider, BaseRecord, BaseKey } from "@refinedev/core";
import {
  getList,
  getOne,
  create,
  update,
  deleteOne,
} from "@/app/actions/data";

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    console.log("dataProvider getList pagination:", pagination);
    const response = await getList(resource, {
      current: (pagination as any)?.current,
      pageSize: (pagination as any)?.pageSize,
      filters,
      sorters,
    });
    return {
      data: response.data,
      total: response.total,
    };
  },

  getOne: async ({ resource, id }) => {
    const response = await getOne(resource, id as string);
    return {
      data: response.data,
    };
  },

  create: async ({ resource, variables }) => {
    const response = await create(resource, variables);
    return {
      data: response.data,
    };
  },

  update: async ({ resource, id, variables }) => {
    const response = await update(resource, id as string, variables);
    return {
      data: response.data,
    };
  },

  deleteOne: async ({ resource, id }) => {
    const response = await deleteOne(resource, id as string);
    return {
      data: { id: id as BaseKey } as any, // TODO: This is a temporary fix. The deleteOne action should return the deleted record.
    };
  },

  getMany: async ({ resource, ids }) => {
    // Implement getMany if needed, or throw an error if not supported
    throw new Error("getMany not implemented.");
  },

  createMany: async ({ resource, variables }) => {
    // Implement createMany if needed, or throw an error if not supported
    throw new Error("createMany not implemented.");
  },

  updateMany: async ({ resource, ids, variables }) => {
    // Implement updateMany if needed, or throw an error if not supported
    throw new Error("updateMany not implemented.");
  },

  deleteMany: async ({ resource, ids }) => {
    // Implement deleteMany if needed, or throw an error if not supported
    throw new Error("deleteMany not implemented.");
  },

  getApiUrl: () => {
    return ""; // Not applicable for Server Actions
  },

  custom: async ({ url, method, filters, sorters, payload, query }) => {
    // Implement custom if needed, or throw an error if not supported
    throw new Error("custom not implemented.");
  },
};