class ServoController {
    void moveTo(int x, int y) {
        System.out.println("Fräse fährt zu (" + x + ", " + y + ")");
    }

    void setSpindle(boolean on) {
        System.out.println(on ? "Spindel an" : "Spindel aus");
    }
}
