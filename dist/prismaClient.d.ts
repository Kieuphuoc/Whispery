import { Prisma } from '@prisma/client';
/**
 * Parses PostGIS EWKB geometry Point into latitude and longitude.
 * PostGIS EWKB format for Point: [byteOrder(1), type(4), SRID(4), X(8), Y(8)]
 * Note: X is Longitude, Y is Latitude.
 */
export declare function parseEWKBPoint(buffer: Buffer | string | any): {
    latitude: number;
    longitude: number;
} | null;
declare const prisma: import("@prisma/client/runtime/library").DynamicClientExtensionThis<Prisma.TypeMap<import("@prisma/client/runtime/library").InternalArgs & {
    result: {};
    model: {
        voicePin: {
            createWithLocation: () => (data: any) => Promise<any>;
            updateWithLocation: () => (params: {
                where: Prisma.VoicePinWhereUniqueInput;
                data: any;
            }) => Promise<any>;
            findManyInBBox: () => (params: {
                minLat: number;
                maxLat: number;
                minLng: number;
                maxLng: number;
                visibility?: string;
                limit?: number;
            }) => Promise<any[]>;
            findRandomNearby: () => (params: {
                lat: number;
                lng: number;
                radiusKm: number;
                userId?: number;
                limit?: number;
            }) => Promise<any[]>;
        };
    };
    query: {};
    client: {};
}, {}>, Prisma.TypeMapCb<Prisma.PrismaClientOptions>, {
    result: {};
    model: {
        voicePin: {
            createWithLocation: () => (data: any) => Promise<any>;
            updateWithLocation: () => (params: {
                where: Prisma.VoicePinWhereUniqueInput;
                data: any;
            }) => Promise<any>;
            findManyInBBox: () => (params: {
                minLat: number;
                maxLat: number;
                minLng: number;
                maxLng: number;
                visibility?: string;
                limit?: number;
            }) => Promise<any[]>;
            findRandomNearby: () => (params: {
                lat: number;
                lng: number;
                radiusKm: number;
                userId?: number;
                limit?: number;
            }) => Promise<any[]>;
        };
    };
    query: {};
    client: {};
}>;
export default prisma;
//# sourceMappingURL=prismaClient.d.ts.map