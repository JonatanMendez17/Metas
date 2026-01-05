#!/usr/bin/env node

/**
 * Script para ayudar a configurar los secrets de GitHub Actions
 * 
 * Este script te ayudará a obtener la información necesaria para configurar
 * el despliegue automático en GitHub Actions.
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🚀 Configuración de GitHub Secrets para Firebase\n');
console.log('='.repeat(60));
console.log('\n📋 Información del proyecto:');
console.log('   Project ID: metas-2cc55');
console.log('\n📝 Pasos para configurar los secrets:\n');

console.log('1️⃣  Obtener la cuenta de servicio de Firebase:');
console.log('   a) Ve a: https://console.firebase.google.com/project/metas-2cc55/settings/serviceaccounts/adminsdk');
console.log('   b) Haz clic en "Generar nueva clave privada"');
console.log('   c) Se descargará un archivo JSON');
console.log('   d) Copia TODO el contenido de ese archivo JSON\n');

console.log('2️⃣  Configurar el secret en GitHub:');
console.log('   a) Ve a tu repositorio en GitHub');
console.log('   b) Settings → Secrets and variables → Actions');
console.log('   c) Haz clic en "New repository secret"\n');

console.log('3️⃣  Crear el secret FIREBASE_SERVICE_ACCOUNT:');
console.log('   Name: FIREBASE_SERVICE_ACCOUNT');
console.log('   Value: [Pega aquí TODO el contenido del archivo JSON descargado]\n');

console.log('✅ ¡Listo! El workflow usará automáticamente el Project ID: metas-2cc55\n');

console.log('🔗 Enlaces útiles:');
console.log('   - Firebase Console: https://console.firebase.google.com/project/metas-2cc55');
console.log('   - GitHub Actions: https://github.com/[TU_USUARIO]/[TU_REPO]/settings/secrets/actions\n');

console.log('='.repeat(60));
console.log('\n💡 Tip: Si ya tienes el archivo JSON, puedes leerlo con:');
console.log('   cat [nombre-del-archivo].json\n');

