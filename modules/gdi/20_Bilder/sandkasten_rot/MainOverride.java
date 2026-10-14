class MainOverride {
    // Lädt das Bild aus den Argumenten (Breite, Höhe, RGB-Bytes als Base64), wendet MeineRotTrennung
    // darauf an und schickt das Ergebnis an den Playground.
    public static void main(String[] args) {
        int width = Integer.parseInt(args[0]);
        int height = Integer.parseInt(args[1]);
        byte[] rgb = base64Decode(args[2]);

        int[][] colors = new int[width][height];
        int pos = 0;
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                colors[x][y] = ((rgb[pos] & 0xFF) << 16) | ((rgb[pos + 1] & 0xFF) << 8) | (rgb[pos + 2] & 0xFF);
                pos += 3;
            }
        }

        new MeineRotTrennung().filter(colors);

        byte[] out = new byte[width * height * 3];
        pos = 0;
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int c = colors[x][y];
                out[pos++] = (byte) (c >> 16);
                out[pos++] = (byte) (c >> 8);
                out[pos++] = (byte) c;
            }
        }
        de.fau.tf.lgdv.CodeBlocks.postResult("{\"width\":" + width + ", \"height\":" + height + ", \"data\":\"" + base64Encode(out) + "\"}");
    }

    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    private static byte[] base64Decode(String s) {
        int[] lookup = new int[128];
        for (int i = 0; i < CHARS.length(); i++) lookup[CHARS.charAt(i)] = i;
        int len = s.length();
        while (len > 0 && s.charAt(len - 1) == '=') len--;
        byte[] out = new byte[len * 6 / 8];
        int buffer = 0, bits = 0, pos = 0;
        for (int i = 0; i < len; i++) {
            buffer = (buffer << 6) | lookup[s.charAt(i)];
            bits += 6;
            if (bits >= 8) {
                bits -= 8;
                out[pos++] = (byte) (buffer >> bits);
            }
        }
        return out;
    }

    private static String base64Encode(byte[] data) {
        char[] out = new char[(data.length + 2) / 3 * 4];
        int pos = 0;
        for (int i = 0; i < data.length; i += 3) {
            int n = (data[i] & 0xFF) << 16;
            if (i + 1 < data.length) n |= (data[i + 1] & 0xFF) << 8;
            if (i + 2 < data.length) n |= data[i + 2] & 0xFF;
            out[pos++] = CHARS.charAt((n >> 18) & 63);
            out[pos++] = CHARS.charAt((n >> 12) & 63);
            out[pos++] = i + 1 < data.length ? CHARS.charAt((n >> 6) & 63) : '=';
            out[pos++] = i + 2 < data.length ? CHARS.charAt(n & 63) : '=';
        }
        return new String(out);
    }
}
