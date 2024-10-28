class Helper {
    public static boolean isPrime(Integer n) {
        for (int k = 2; k <= n / k; k++) {
            if (n % k == 0) {
                return false;
            }
        }
        return true;
    }
}
