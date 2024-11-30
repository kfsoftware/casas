'use server'

import { connectToDatabase } from '@/lib/mongodb';
import { House } from '@/types/house';
import { ObjectId } from 'mongodb';

export async function getHouses() {
  const client = await connectToDatabase();
  const collection = client.db('casa').collection('houses');
  return collection.find({}).toArray();
}

export async function addHouse(house: House) {
  const client = await connectToDatabase();
  const collection = client.db('casa').collection('houses');
  
  // Calcular la puntuación
  const score = calculateScore(house);
  const houseWithScore = { ...house, score };
  
  const result = await collection.insertOne(houseWithScore);
  return result;
}

export async function updateHouse(id: string, house: House) {
  const client = await connectToDatabase();
  const collection = client.db('casa').collection('houses');
  
  const score = calculateScore(house);
  const houseWithScore = { ...house, score };
  
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: houseWithScore }
  );
  return result;
}

export async function deleteHouse(id: string) {
  const client = await connectToDatabase();
  const collection = client.db('casa').collection('houses');
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}

export async function getHouse(id: string) {
  const client = await connectToDatabase();
  const collection = client.db('casa').collection('houses');
  
  return collection.findOne({ _id: new ObjectId(id) });
}

function calculateScore(house: House): number {
  let score = 0;
  
  // CALIDAD DE VIDA INTERIOR (3 puntos)
  if (house.officeSpace) score += 1;
  score += house.soundInsulation;
  score += house.internetQuality;
  
  // LUZ Y CONFORT TÉRMICO (2.5 puntos)
  score += house.naturalLight;
  score += house.naturalVentilation * 0.75;
  score += house.climatization * 0.75;
  
  // DISTRIBUCIÓN Y ESPACIO (2 puntos)
  if (house.workRestSeparation) score += 0.75;
  if (house.movementSpace) score += 0.5;
  if (house.versatileSpaces) score += 0.75;
  
  // INSTALACIONES (1.5 puntos)
  score += house.electricalOutlets * 0.5;
  score += house.electricalInstallation * 0.5;
  score += house.mobileSignal * 0.5;
  
  // ENTORNO INMEDIATO (1 punto)
  score += (1 - house.noiseLevel) * 0.5; // Invertimos el nivel de ruido
  if (house.hasBalcony) score += 0.5;
  
  return Number(score.toFixed(2));
} 