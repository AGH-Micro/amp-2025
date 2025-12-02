function [coeff, Ox, Oy,phi ] = coeff(X,Y)


coeff=[];
Ox=0;
Oy=0;
phi=0;
    
        z=X; v=Y;
        M=[(z.*v)' (v.^2)' z' v' ones(length(z),1)];
        C=-(z.^2)';
        %macierz do wyliczania współczynników równania elipsy w postaci
        %ogólen, Ox,Oy to środki
        %przyjmujemy że a=1
        coeff=(pinv(((M')*M)))*(M')*C;
    
            b=coeff(1);
            c=coeff(2);
            d=coeff(3);
            e=coeff(4);
            f=coeff(5);
    
        Ox=(0.5*c*d-0.25*b*e)/(0.25*b^2-c);
        Oy=(0.5*e-0.25*b*d)/(0.25*b^2-c);
        phi=asin(b/(2*sqrt(c)));


end