import numpy as np

def hitung_eigen(kovariansi):
    eigenvalue, eigenvector = np.linalg.eigh(kovariansi)
    index = np.argsort(eigenvalue)[::-1]
    
    return eigenvalue[index], eigenvector[:, index]

def run_pca(channel_data, rate_kompresi):
    mean = np.mean(channel_data, axis=0)
    data_terpusat = channel_data - mean
    
    kovariansi = np.cov(data_terpusat, rowvar=False)
    eigenvalue, eigenvector = hitung_eigen(kovariansi)
    max_komponen = len(eigenvalue)
    
    faktor_retensi = (100.0 - rate_kompresi) / 100.0
    k = int(max_komponen * (faktor_retensi ** 3)) 
    k = max(1, k)
    
    vektor_terpilih = eigenvector[:, :k]
    data_proyeksi = np.dot(data_terpusat, vektor_terpilih)
    data_rekonstruksi = np.dot(data_proyeksi, vektor_terpilih.T) + mean
    
    return data_rekonstruksi

def kompresi_image(img_array, rate_kompresi):
    tinggi, lebar, channel = img_array.shape
    img_hasil = np.zeros_like(img_array, dtype=np.float32)
    
    for i in range(channel):
        channel_data = img_array[:, :, i].astype(np.float32)
        channel_terkompresi = run_pca(channel_data, rate_kompresi)
        img_hasil[:, :, i] = channel_terkompresi
        
    img_hasil = np.clip(img_hasil, 0, 255).astype(np.uint8)
    return img_hasil