const DB_NAME = 'CampusNotesOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_notes';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this browser.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: '_id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveNoteOffline(resource) {
  if (!resource || !resource._id || !resource.fileUrl) {
    throw new Error('Invalid resource data for offline storage.');
  }

  // Fetch the PDF blob over network
  const response = await fetch(resource.fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download PDF for offline storage (${response.status})`);
  }

  const blob = await response.blob();
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      _id: resource._id,
      title: resource.title,
      branch: resource.branch,
      semester: resource.semester,
      resourceType: resource.resourceType,
      subjectName: resource.subjectId?.name || resource.subjectId?.shortName || '',
      fileBlob: blob,
      savedAt: Date.now()
    };

    const request = store.put(record);

    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

export async function isNoteSavedOffline(resourceId) {
  if (!resourceId) return false;
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(resourceId);

      request.onsuccess = () => resolve(Boolean(request.result));
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function getOfflineNote(resourceId) {
  if (!resourceId) return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(resourceId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function removeOfflineNote(resourceId) {
  if (!resourceId) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(resourceId);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOfflineNotes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
