//#START STATIC
public class App {
    public static void main(String[] args) {
        final double[][] KERNEL = Kernels.getKernel(args);
        Image img = Image.load(args);

//#START STUDENT
        /* TODO */

//#START SOLUTION
        // neues Feld für das Ergebnisbild (erster Index: Spalte, zweiter Index: Zeile)
        int[][] output = new int[img.width][img.height];

        // Randpixel auslassen, sie haben keine vollständige 3x3-Nachbarschaft
        for (int y = 1; y < img.height - 1; y++) {
            for (int x = 1; x < img.width - 1; x++) {
                double result = 0;
                for (int b = -1; b <= 1; b++) {
                    for (int a = -1; a <= 1; a++) {
                        result += img.data[x + a][y + b] * KERNEL[b + 1][a + 1];
                    }
                }
                output[x][y] = (int) Math.round(result);
            }
        }
        img = new Image(output);

//#START STATIC
        img.save();
    }
}

//#START API
class Kernels {
    static final double[][] BOX = {
            {1.0/9.0, 1.0/9.0, 1.0/9.0},
            {1.0/9.0, 1.0/9.0, 1.0/9.0},
            {1.0/9.0, 1.0/9.0, 1.0/9.0}
    };

    static final double[][] SOBEL_X = {
        {1, 0, -1},
        {2, 0, -2},
        {1, 0, -1}
    };

    static final double[][] SOBEL_Y = {
        {1, 2, 1},
        {0, 0, 0},
        {-1, -2, -1}
    };

    public static double[][] getKernel(String[] args){
        int val = args.length<4?0:Integer.parseInt(args[3]);
        if (val==1) return SOBEL_X;
        if (val==2) return SOBEL_Y;
        return BOX;
    }
}

class Image {
    public final int width;
    public final int height;
    public final int[][] data;

    public static Image load(String[] args){
        int width = Integer.parseInt(args[0]);
        int height = Integer.parseInt(args[1]);
        int[][] data = new int[width][height];

        int[] input = Image.base64Decode(args[2]);
        int pos = 0;
        for (int y=0; y<height; y++){
            for (int x=0; x<width; x++){
                data[x][y] = input[pos++];
            }
        }
        return new Image(data);
    }

    public Image(int[][] data){
        this.width = data.length;
        if (width == 0) this.height = 0;
        else this.height = data[0].length;

        this.data = data;
    }

    public void save(){
        int[] flat = new int[this.width * this.height];
        int pos = 0;
        for (int y=0; y<height; y++){
            for (int x=0; x<width; x++){
                flat[pos++] = Math.min(255, Math.max(0, data[x][y]));
            }
        }
        String base64 = Image.base64Encode(flat);
        de.fau.tf.lgdv.CodeBlocks.postResult("{\"width\":" + this.width + ", \"height\":" + this.height + ", \"data\":\""+ base64 +"\"}");
    }

    private static final String base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    public static int[] base64Decode(String base64String) {
        StringBuilder binaryString = new StringBuilder();

        // Convert each base64 character to its binary representation
        for (char c : base64String.toCharArray()) {
             if (c == '=') {
                break; // Ignore padding characters
            }
            int charIndex = base64Chars.indexOf(c);
            String binary = Integer.toBinaryString(charIndex);
            // Append leading zeros if necessary
            binaryString.append(pad(6 - binary.length(), '0')).append(binary);
        }

        // Convert the binary string to bytes
        int[] decodedBytes = new int[binaryString.length() / 8];
        for (int i = 0; i < binaryString.length()-7; i += 8) {
            String byteString = binaryString.substring(i, i + 8);

            decodedBytes[i / 8] = Integer.parseInt(byteString, 2);
        }

        return decodedBytes;
    }

    public static String base64Encode(int[] bytes) {
        StringBuilder binaryString = new StringBuilder();

        // Convert bytes to binary string
        for (int b : bytes) {
            binaryString.append(byteToBinaryString(b));
        }

        // Append padding zeros if necessary
        int padding = binaryString.length() % 6;
        if (padding != 0) {
            binaryString.append(pad(6 - padding, '0'));
        }

        // Convert binary string to Base64 characters
        StringBuilder encodedString = new StringBuilder();
        for (int i = 0; i < binaryString.length(); i += 6) {
            String binaryChunk = binaryString.substring(i, i + 6);
            int charIndex = Integer.parseInt(binaryChunk, 2);
            encodedString.append(base64Chars.charAt(charIndex));
        }

        // Add padding characters if necessary
        int paddingCount = (bytes.length % 3 == 1) ? 2 : (bytes.length % 3 == 2) ? 1 : 0;
        encodedString.append(pad(paddingCount, '='));

        return encodedString.toString();
    }

    private static String byteToBinaryString(int b) {
        StringBuilder binary = new StringBuilder();
        int value = b & 0xFF;
        for (int i = 7; i >= 0; i--) {
            binary.append((value >> i) & 1);
        }
        return binary.toString();
    }

    private static String pad(int count, char c) {
        StringBuilder padding = new StringBuilder();
        for (int i = 0; i < count; i++) {
            padding.append(c);
        }
        return padding.toString();
    }
}
