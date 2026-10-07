//#START STATIC
class Walze {
//#START STUDENT
    //
    // Schreiben Sie hier die Implementierung Ihrer Klasse Walze
    //
//#START SOLUTION
    private int[] mapping;

    public Walze(int[] mapping) {
        this.mapping = mapping;
    }

    public char encrypt(char c) {
        int index = Helper.getIndexFromChar(c);
        if (index < 0 || index > 25) {
            return '?';
        }
        return Helper.getCharFromIndex(mapping[index]);
    }

    public char decrypt(char c) {
        // Umkehrung: die Stelle suchen, an der das Mapping auf c zeigt
        int index = Helper.getIndexFromChar(c);
        for (int i = 0; i < mapping.length; i++) {
            if (index >= 0 && mapping[i] == index) {
                return Helper.getCharFromIndex(i);
            }
        }
        return '?';
    }
//#START STATIC
}
