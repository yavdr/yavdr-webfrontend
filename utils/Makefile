LOCDIR   = ./locale
CFLAGS=-g -fPIC -I.. -DLOCDIR=\"$(LOCDIR)\"  -I/usr/share/doc/nvidia-settings/examples/samples/ -I/usr/include/NVCtrl
LDLIBS=-L/usr/lib/yavdr -lyavdrdb -lneo_utl -lX11 -lXext

all: signalsession

clean:
	@rm -rf signalsession *.o

install:
	@install signalsession $(DESTDIR)/usr/bin/
