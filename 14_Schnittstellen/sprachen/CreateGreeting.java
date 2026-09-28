//#START STUDENT

//#START SOLUTION
    private static Greeting createGreeting(String lang) {
        if ("de".equals(lang)) {
            return new Deutsch();
        }
        // alles andere, auch ungültige Angaben: Englisch
        return new English();
    }
//#START STATIC
}
