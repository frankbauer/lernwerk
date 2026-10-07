//#START STUDENT
// Klasse Service (Teilaufgaben 1 bis 4)

//#START SOLUTION
class Service {
    // Attribute: konstant, daher final
    private final String name;
    private final int x;
    private final int y;
    private final double power;
    private final double frequency;

    // öffentliche Klassenkonstanten für die Sendefrequenzen
    public static final double FREQUENCY_WIFI = 2.4;
    public static final double FREQUENCY_LTE = 2.6;
    public static final double FREQUENCY_E = 0.9;

    // WLAN: Name und Position übergeben, Sendeleistung und Frequenz fest
    public Service(String name, int x, int y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.power = 0.3;
        this.frequency = Service.FREQUENCY_WIFI;
    }

    // Mobilfunk: LTE oder E
    public Service(int x, int y, boolean isLTE) {
        this.x = x;
        this.y = y;
        if (isLTE) {
            this.name = "LTE";
            this.power = 8000;
            this.frequency = Service.FREQUENCY_LTE;
        } else {
            this.name = "E";
            this.power = 18000;
            this.frequency = Service.FREQUENCY_E;
        }
    }

    // Getter müssen public sein, sonst könnte Connection die Werte nicht lesen
    public String getName() {
        return name;
    }

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public double getPower() {
        return power;
    }

    public double getFrequency() {
        return frequency;
    }
}
