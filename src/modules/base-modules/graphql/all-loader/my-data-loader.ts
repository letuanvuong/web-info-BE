import * as DataLoader from 'dataloader'

/**
 * Được custom trên DataLoader gốc
 *
 * thay đổi: tự động return null thay vì throw lỗi load invalid,
 * phục vụ bỏ qua quá trình tự kiểm tra thủ công mỗi khi load
 */
export class MyDataLoader<K, V, C = K> extends DataLoader<K, V, C> {
  constructor(
    batchLoadFn: DataLoader.BatchLoadFn<K, V>,
    options?: DataLoader.Options<K, V, C>,
  ) {
    super(batchLoadFn, options)
  }

  // thay vì throw lỗi như lib gốc, custom thêm tự return null
  load(key: K) {
    if (!key) return null
    return super.load(key)
  }

  loadMany(keys: ArrayLike<K>): Promise<V[]> {
    // khi không thỏa arr, để thư viện tự throw lỗi
    if (!Array.isArray(keys)) {
      super.loadMany(keys)
    }

    // khi thỏa arr, gọi hàm load mới để tránh throw lỗi load invalid
    const arrPromises: Promise<V>[] = []

    for (let i = 0; i < keys.length; i++) {
      arrPromises.push(this.load(keys[i]))
    }

    return Promise.all(arrPromises)
  }
}
